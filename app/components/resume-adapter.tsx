"use client"

import { useState } from "react"
import styles from "./resume-adapter.module.css"

interface AdapterState {
  vacancy: string
  resume: string
  adaptedResume: string
  recommendations: string
  chances: string
  error: string
  isLoading: boolean
  showChanges: boolean
}

export default function ResumeAdapter() {
  const [state, setState] = useState<AdapterState>({
    vacancy: "",
    resume: "",
    adaptedResume: "",
    recommendations: "",
    chances: "",
    error: "",
    isLoading: false,
    showChanges: true
  })

  // Parse special markup: [[+text]], [[~old→new]], [[^text]]
  const parseResume = (text: string, showChanges: boolean = true) => {
    if (!text) return '';
  
    let parsed = text

    if (showChanges) {
      parsed = parsed
        // Добавленный: [[+ДОБАВЛЕНО]]
        .replace(/\[\[\+([^\]]+)\]\]/g, '<mark class="added">$1</mark>')
        // Измененный: [[~БЫЛО→СТАЛО]]
        .replace(/\[\[~([^→]+)→([^\]]+)\]\]/g, '<del>$1</del> → <ins>$2</ins>')
        // Перемещенный: [[^ПЕРЕМЕЩЕНО]]
        .replace(/\[\[\^([^\]]+)\]\]/g, '<span class="moved">$1</span>')
        .replace(/\n/g, "<br />");  // ← ДОБАВЬ, если нужны переносы строк
    } else {
      parsed=parsed
        .replace(/\[\[\+([^\]]+)\]\]/g, '$1')  // Оставляем только добавленный текст
        .replace(/\[\[~([^→]+)→([^\]]+)\]\]/g, '$2')  // Оставляем только новую версию (после →)
        .replace(/\[\[\^([^\]]+)\]\]/g, '$1')  // Оставляем текст как есть
        .replace(/\n/g, "<br />");
    }
  
    return parsed;
  };

  const validateForm = (): boolean => {
    if (!state.vacancy.trim() || !state.resume.trim()) {
      setState((prev) => ({
        ...prev,
        error: "Пожалуйста, заполните оба поля - вакансию и резюме",
      }))
      return false
    }
    setState((prev) => ({ ...prev, error: "" }))
    return true
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return

    setState((prev) => ({
      ...prev,
        adaptedResume: "",
        recommendations: "",
        chances: "",
        isLoading: true,
        error: "",
    }))

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vacancy: state.vacancy,
          resume: state.resume,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        setState((prev) => ({
          ...prev,
          error: data.error || `Ошибка: ${response.statusText}` || 'Произошла ошибка',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        adaptedResume: data.adaptedResume || "",
        recommendations: data.recommendations || "",
        chances: data.chances || "",
        error: "",
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Произошла ошибка при обработке запроса"
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }))
    } finally {
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }))
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Адаптируй резюме под вакансию</h1>
        </header>

        {/* Input Section */}
        <section className={styles.inputSection}>
          <div className={styles.inputColumn}>
            <label className={styles.label} htmlFor="vacancy">
              Скопируй и вставь текст вакансии
            </label>
            <textarea
              id="vacancy"
              className={styles.textarea}
              rows={10}
              placeholder="Вставьте описание вакансии здесь..."
              value={state.vacancy}
              onChange={(e) => setState((prev) => ({ ...prev, vacancy: e.target.value }))}
              disabled={state.isLoading}
            />
          </div>

          <div className={styles.inputColumn}>
            <label className={styles.label} htmlFor="resume">
              Скопируй и вставь текст резюме
            </label>
            <textarea
              id="resume"
              className={styles.textarea}
              rows={10}
              placeholder="Вставьте ваше резюме здесь..."
              value={state.resume}
              onChange={(e) => setState((prev) => ({ ...prev, resume: e.target.value }))}
              disabled={state.isLoading}
            />
          </div>
        </section>

        {/* Error Message */}
        {state.error && <div className={styles.errorMessage}>{state.error}</div>}

        {/* Action Button */}
        <button className={styles.submitButton} onClick={handleSubmit} disabled={state.isLoading}>
          {state.isLoading ? "Обработка..." : "Адаптировать"}
        </button>
        {/* Chances */}
        {state.chances && (
          <div className={styles.outputCard}>
            <h2 className={styles.outputTitle}>Насколько получилось увеличить соответствие вакансии?</h2>
            <div className={styles.chancesContent}>{state.chances}</div>
          </div>
        )}
        {/* Output Section */}
        {(state.adaptedResume || state.recommendations || state.chances) && (
          <section className={styles.outputSection}>
            {/* Adapted Resume */}
            {state.adaptedResume && (
              <div className={styles.outputCard}>
                <div className={styles.outputTitleContainer}>
                  <h2 className={styles.outputTitle}>Адаптированное резюме</h2>
                  <label className={styles.toggleContainer}>
                    <span className={styles.toggleLabel}>Показать изменения</span>
                    <input
                      type="checkbox"
                      checked={state.showChanges}
                      onChange={(e) => setState((prev)=>({...prev, showChanges: e.target.checked}))}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
                <div className={styles.outputContent}>
                  <div
                    className={styles.htmlContent}
                    dangerouslySetInnerHTML={{ __html: parseResume(state.adaptedResume, state.showChanges) }}
                  />
                </div>
              </div>
            )}

            {/* Recommendations */}
            {state.recommendations && (
              <div className={styles.outputCard}>
                <h2 className={styles.outputTitle}>Рекомендации по подготовке к интервью</h2>
                <div className={styles.outputContent}>
                  <div
                    className={styles.htmlContent}
                    dangerouslySetInnerHTML={{
                      __html: parseResume(state.recommendations),
                    }}
                  />
                </div>
              </div>
            )}


          </section>
        )}
      </div>
    </div>
  )
}
