import { motion } from 'motion/react';
import { BookOpenCheck, Camera, CircleAlert, FileCheck2, Mail, SlidersHorizontal, Shield, UserRoundCheck } from 'lucide-react';

const termsSections = [
  {
    title: 'Using FocusSpark',
    icon: BookOpenCheck,
    body: 'FocusSpark provides study planning, focus support, browser-based study assistance, AI-assisted learning tools, analytics, flashcards, quizzes, and related productivity features for students.',
  },
  {
    title: 'Accounts',
    icon: UserRoundCheck,
    body: 'You are responsible for the information you provide, keeping your login details secure, and using your account in a lawful and respectful way.',
  },
  {
    title: 'Acceptable Use',
    icon: Shield,
    body: 'Do not misuse FocusSpark, attempt to disrupt the service, access accounts or systems without permission, or use the product for harmful or illegal activity.',
  },
  {
    title: 'Learning Content',
    icon: FileCheck2,
    body: 'AI, flashcard, quiz, and analytics features can support studying, but they may not always be complete or error-free. You should review important learning outputs before relying on them.',
  },
  {
    title: 'Focus Detection',
    icon: Camera,
    body: 'Camera-based attention support is optional and should be used only with your permission. FocusSpark uses attention-related cues as probabilistic signals, not as final judgments about your attention, emotion, fatigue, or ability.',
  },
  {
    title: 'Learner Control',
    icon: SlidersHorizontal,
    body: 'You can disable camera detection, adjust alert strength, change study plans, and decide which reminders or interventions are helpful. FocusSpark is designed to suggest and support, not punish or make decisions for you.',
  },
  {
    title: 'Service Availability',
    icon: CircleAlert,
    body: 'We work to keep FocusSpark available and reliable, but the service may change, pause, or be unavailable from time to time for maintenance or improvements.',
  },
  {
    title: 'Contact',
    icon: Mail,
    body: 'For questions about these terms, contact us at focussparkai@gmail.com.',
  },
];

export function TermsPage() {
  return (
    <div className="pt-16">
      <section className="py-20 px-6 lg:px-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6 max-w-5xl mx-auto"
          >
            Terms of <span className="gradient-text">Service</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            These terms explain the basic rules for using FocusSpark and help keep the
            experience useful, fair, privacy-aware, and reliable for students.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {termsSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.article
                key={section.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl mb-3">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.body}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="py-16 px-6 lg:px-20 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl mb-4">Changes to These Terms</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We may update these terms as FocusSpark develops, especially as focus support,
              AI tools, and learning features improve. The latest version will remain available
              on this page.
            </p>
          </div>
          <p className="mt-12 text-right text-sm text-muted-foreground">Last updated: June 14, 2026</p>
        </div>
      </section>
    </div>
  );
}
