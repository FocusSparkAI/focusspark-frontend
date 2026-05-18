import { useState } from 'react';
import { motion } from 'motion/react';
import { Target, Bot, BookOpen, TrendingUp, Zap, Coffee } from 'lucide-react';
import { Button } from './ui/button';

const features = [
  {
    id: 'deep-work',
    icon: Target,
    title: 'Deep Work',
    description: 'Eliminate distractions and enter flow state with AI-powered focus sessions.',
    gradient: 'from-blue-500 to-purple-600',
  },
  {
    id: 'ai-tutor',
    icon: Bot,
    title: 'AI Tutor',
    description: 'Get instant answers and personalized explanations for any topic.',
    gradient: 'from-blue-600 to-cyan-500',
  },
  {
    id: 'learning',
    icon: BookOpen,
    title: 'Learning (PDF/Notes)',
    description: 'Upload your materials and organize summaries for focused study.',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 'goal-tracking',
    icon: TrendingUp,
    title: 'Goal Tracking',
    description: 'Set goals, track progress, and stay motivated with smart insights.',
    gradient: 'from-green-500 to-teal-500',
  },
  {
    id: 'motivation',
    icon: Zap,
    title: 'Motivation',
    description: 'Science-backed rewards and streaks to keep you energized.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'unwind',
    icon: Coffee,
    title: 'Unwind',
    description: 'Guided breaks and mindfulness exercises to recharge your mind.',
    gradient: 'from-teal-500 to-emerald-500',
  },
];

export function Features() {
  const [activeFeature, setActiveFeature] = useState(features[0].id);

  const active = features.find(f => f.id === activeFeature);

  return (
    <section className="py-20 px-6 lg:px-20 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl mb-4 text-foreground">
            Tools made for <span className="gradient-text">Deep Work</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Modes designed for every kind of learner.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.button
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveFeature(feature.id)}
                className={`relative group p-6 rounded-2xl border-2 transition-all bg-card overflow-hidden shadow-sm ${
                  activeFeature === feature.id
                    ? 'bg-card border-blue-500 glow-blue-purple'
                    : 'bg-card/50 border-border hover:border-blue-500/50'
                }`}
                whileHover={{ y: -8, scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Gradient glow background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />
                
                {/* Icon with gradient glow */}
                <motion.div
                  className="relative flex items-center justify-center mb-3"
                  animate={{ 
                    rotate: activeFeature === feature.id ? [0, -10, 10, 0] : 0 
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                  <Icon 
                    className={`relative w-10 h-10 transition-all duration-300 ${
                      activeFeature === feature.id 
                        ? 'text-blue-500' 
                        : 'text-muted-foreground group-hover:text-blue-400'
                    }`}
                    strokeWidth={1.5}
                  />
                </motion.div>
                
                {/* Title */}
                <div className="relative text-sm font-semibold text-foreground opacity-90 group-hover:opacity-100 transition-opacity">
                  {feature.title}
                </div>

                {/* Active indicator */}
                {activeFeature === feature.id && (
                  <motion.div
                    layoutId="active-feature-indicator"
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Active Feature Display */}
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative bg-card border border-border rounded-2xl p-8 md:p-12 text-center max-w-3xl mx-auto overflow-hidden shadow-sm"
          >
            {/* Background gradient glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${active.gradient} opacity-5`} />
            
            {/* Icon with animated glow */}
            <motion.div 
              className="relative flex items-center justify-center mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${active.gradient} blur-3xl opacity-30 pulse-glow`} />
              <active.icon 
                className="relative w-20 h-20 text-blue-500" 
                strokeWidth={1.5}
              />
            </motion.div>

            {/* Title */}
            <motion.h3 
              className="text-3xl mb-4 text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {active.title}
            </motion.h3>

            {/* Description */}
            <motion.p 
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {active.description}
            </motion.p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 hover:scale-105 transition-all px-8 py-6"
          >
            Try FocusSpark for Free
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
