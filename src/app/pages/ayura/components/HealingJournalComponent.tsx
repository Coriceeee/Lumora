import React, { useState, useEffect } from 'react';
import { useAyuraCore } from '../AyuraCoreProvider';

export const HealingJournalComponent: React.FC = () => {
  const [entry, setEntry] = useState('');
  const [feedback, setFeedback] = useState('');
  const { addJournalEntry, emotion } = useAyuraCore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entry.trim() === '') return;
    addJournalEntry(entry);
    setEntry('');
  };

  useEffect(() => {
    // Phản hồi đồng cảm dựa trên valence
    if (emotion.valence >= 0.5) {
      setFeedback("I'm glad you're feeling positive!");
    } else {
      setFeedback("I hear you. Thank you for sharing.");
    }
  }, [emotion]);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Healing Journal</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border rounded mb-2"
          placeholder="Write or speak your thoughts..."
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          rows={4}
        />
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          type="submit"
        >
          Submit
        </button>
      </form>
      {emotion && (
        <div className="mt-4">
          <p><strong>Emotion Scores:</strong></p>
          <ul className="list-disc list-inside">
            <li>Valence: {emotion.valence.toFixed(2)}</li>
            <li>Arousal: {emotion.arousal.toFixed(2)}</li>
            <li>Calmness: {emotion.calmness.toFixed(2)}</li>
            <li>Overall Score: {emotion.score.toFixed(2)}</li>
          </ul>
        </div>
      )}
      {feedback && (
        <div className="mt-4 italic text-gray-600">Feedback: "{feedback}"</div>
      )}
    </div>
  );
};
