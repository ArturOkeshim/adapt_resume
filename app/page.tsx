'use client';
import { useState } from 'react';

export default function Home() {
  const [vacancy, setVacancy] = useState('');
  const [resume, setResume] = useState('');
  const [adaptedResume, setAdaptedResume] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [chances, setChances] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const parseResume = (text: string) => {
    if (!text) return '';
  
    let parsed = text
      // Добавленный: [[+ДОБАВЛЕНО]]
      .replace(/\[\[\+([^\]]+)\]\]/g, '<mark class="added">$1</mark>')
      // Измененный: [[~БЫЛО→СТАЛО]]
      .replace(/\[\[~([^→]+)→([^\]]+)\]\]/g, '<del>$1</del> → <ins>$2</ins>')
      // Перемещенный: [[^ПЕРЕМЕЩЕНО]]
      .replace(/\[\[\^([^\]]+)\]\]/g, '<span class="moved">$1</span>');
  
    return parsed;
  };
  const validateForm = () => {
    if (!vacancy.trim() || !resume.trim()) {
      setError('Заполните все поля');
      return false;
    } else {
      setError('');
      return true
    }
  }
  const handleSubmit = async () =>{
    if (!validateForm()) {
      return;
    }
    setAdaptedResume('');
    setRecommendations('');
    setChances('');

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type':'application/json',
        },
        body: JSON.stringify({
          vacancy: vacancy,
          resume: resume,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        setError(data.error || 'Произошла ошибка')
        return;
      }

      setAdaptedResume(data.adaptedResume || '');
      setRecommendations(data.recommendations || '');
      setChances(data.chances || '');
    } catch (error) {
      setError('Произошла ошибка при обработке запроса');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className = 'form-container'>
      <h1 className = 'Title'> Адаптируй резюме под вакансию </h1>
      <div className = 'block'>
        <label> Скопируй и вставь текст вакансии: </label>
        <textarea
          value={vacancy}
          onChange={(e)=>setVacancy(e.target.value)}
          rows = {10}
        />
      </div>
      <div className = 'block'>
        <label> Скопируй и вставь текст резюме: </label>
        <textarea
          value={resume}
          onChange={(e)=>setResume(e.target.value)}
          rows = {10}
        />
      </div>
      <button 
        onClick={handleSubmit}
        disabled={isLoading}>
        {isLoading ? 'Обработка...' : 'Адаптировать'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div className = 'block'>
        <label>Адаптированное резюме:</label>
        <div 
          className="resume-output"
          dangerouslySetInnerHTML={{ __html: parseResume(adaptedResume) }}
        />
        </div>
      <div className = 'block'>
        <label>Рекомендации по подготовке к интервью:</label> 
        <div
          className="resomendations-output"
          dangerouslySetInnerHTML={{ __html: parseResume(recommendations) }}
        >
        </div>
      </div>
      <div className='result'>
        <label>Оценка шансов:</label>
        <div>
          {chances ? chances :''}
        </div>
      </div>
    </div>
  );
}