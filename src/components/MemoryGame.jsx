import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function MemoryGame({ onFinish, age = 7 }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // Adjust difficulty based on age
  const getCardsByAge = () => {
    if (age <= 5) {
      // Young kids - 4 pairs (8 cards)
      return ['🐶', '🐱', '🐭', '🐹'];
    } else if (age <= 8) {
      // Medium kids - 6 pairs (12 cards)
      return ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'];
    } else {
      // Older kids - 8 pairs (16 cards)
      return ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    }
  };

  const emojis = getCardsByAge();

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const gameCards = [...emojis, ...emojis]
      .map((emoji, index) => ({ id: index, emoji, matched: false }))
      .sort(() => Math.random() - 0.5);
    setCards(gameCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  const handleCardClick = (index) => {
    if (isChecking || flipped.includes(index) || matched.includes(index) || flipped.length >= 2) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      setIsChecking(true);

      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        // Match found!
        const newMatched = [...matched, first, second];
        setMatched(newMatched);
        setFlipped([]);
        setIsChecking(false);

        // Check if game is complete
        if (newMatched.length === cards.length) {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 }
          });

          // Calculate prize based on moves (fewer moves = better prize)
          const minMoves = emojis.length + 2;
          let prize = 3;
          if (moves + 1 < minMoves + 3) prize = 3;
          else if (moves + 1 < minMoves + 6) prize = 2;
          else prize = 1;

          setTimeout(() => {
            onFinish(true, prize);
          }, 2000);
        }
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setFlipped([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const gridCols = emojis.length <= 4 ? 'grid-cols-4' : emojis.length <= 6 ? 'grid-cols-4' : 'grid-cols-4';

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-8 text-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-3">משחק זיכרון</h3>
        <div className="text-2xl text-gray-600">מהלכים: {moves}</div>
      </div>

      <div className={`grid ${gridCols} gap-4 max-w-3xl w-full`}>
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          const isMatched = matched.includes(index);

          return (
            <motion.div
              key={card.id}
              className="relative aspect-square cursor-pointer"
              onClick={() => handleCardClick(index)}
              whileHover={{ scale: isMatched ? 1 : 1.05 }}
              whileTap={{ scale: isMatched ? 1 : 0.95 }}
            >
              <motion.div
                className="w-full h-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Back of card */}
                <div
                  className={`absolute inset-0 rounded-2xl flex items-center justify-center text-6xl md:text-7xl ${
                    isMatched ? 'bg-green-400' : 'bg-gradient-to-br from-purple-400 to-pink-400'
                  } shadow-lg`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  {card.emoji}
                </div>

                {/* Front of card */}
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="text-6xl md:text-7xl">❓</div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={initializeGame}
        className="mt-8 bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold text-xl px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-transform"
      >
        🔄 משחק חדש
      </button>
    </div>
  );
}