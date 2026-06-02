import { motion } from 'motion/react';
import { Brain, Waves, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function SciencePage() {
  return (
    <div className="pt-16">
      {/* Hero Banner */}
      <section className="py-20 px-6 lg:px-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6 max-w-5xl mx-auto"
          >
            Made with <span className="gradient-text">Science</span>, Tested by{' '}
            <span className="gradient-text">Students</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            FocusSpark is shaped by proven learning principles like active recall,
            spaced repetition, focus cycles, and personalized feedback.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all px-8 py-6"
            >
              <a href="/focusspark-science-white-paper.pdf" download>
                <FileText className="w-5 h-5 mr-2" />
                Read Our White Paper
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="py-20 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="bg-card border border-border rounded-2xl p-5 glow-blue-purple sm:p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>

            <h3 className="text-3xl mb-4">
              AI precision meets <span className="gradient-text">human learning</span>
            </h3>

            <p className="text-lg text-muted-foreground leading-relaxed">
              FocusSpark uses established study methods and adaptive AI to make
              learning more structured. Each session can respond to a student's
              progress, helping them review at the right time and study with
              clearer direction.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="bg-card border border-border rounded-2xl p-5 glow-teal sm:p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <Waves className="w-8 h-8 text-white" />
              </div>
            </div>

            <h3 className="text-3xl mb-4">
              Built for better <span className="gradient-text">focus</span> and
              healthier study <span className="gradient-text">habits</span>
            </h3>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Instead of only tracking tasks, FocusSpark supports the way students
              actually study: short focus sessions, timely review, active recall,
              and feedback that keeps progress visible without adding pressure.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Research Stats */}
      <section className="py-20 px-6 lg:px-20 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl mb-4">The Research Speaks</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: '119%', label: 'Productivity Increase' },
              { value: '4.2x', label: 'Faster Flow State' },
              { value: '87%', label: 'Student Satisfaction' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl px-5 py-8 text-center sm:px-8 sm:py-10"
              >
                <div className="text-4xl gradient-text mb-2 sm:text-5xl">{stat.value}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
