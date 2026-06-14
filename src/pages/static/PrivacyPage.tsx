import { motion } from 'motion/react';
import { CameraOff, Database, Eye, Lock, Mail, ShieldCheck, UserCheck, UsersRound } from 'lucide-react';

const privacySections = [
  {
    title: 'Information We Collect',
    icon: Database,
    body: 'FocusSpark may collect account details such as your name, email address, academic focus, study preferences, goals, session activity, quiz and flashcard progress, browser-study signals, and settings you choose inside the app.',
  },
  {
    title: 'How We Use Data',
    icon: UserCheck,
    body: 'We use your information to create your account, personalize study sessions, suggest breaks or reminders, show progress insights, improve reliability, and communicate important service updates.',
  },
  {
    title: 'Optional Camera Detection',
    icon: Eye,
    body: 'Camera-based focus detection is optional. When enabled, FocusSpark may use visible attention cues such as face presence, head direction, approximate gaze direction, prolonged eye closure, or repeated looking away to support your study session.',
  },
  {
    title: 'Camera Controls',
    icon: CameraOff,
    body: 'If you have a privacy concern or simply do not want camera support, you can turn off camera detection at any time. FocusSpark should remain useful through goals, timers, browser activity, flashcards, quizzes, and progress feedback.',
  },
  {
    title: 'No Third-Party Sharing',
    icon: UsersRound,
    body: 'We do not sell user data, and we do not send user data or camera data to anyone for advertising or unrelated third-party use. FocusSpark uses study and focus information to support the learning experience inside the product.',
  },
  {
    title: 'Probabilistic Signals',
    icon: ShieldCheck,
    body: 'Camera cues are not treated as final proof of attention, emotion, fatigue, or learning. They are only supportive signals that may be combined with study behavior, browser activity, user feedback, and learning performance.',
  },
  {
    title: 'Security',
    icon: Lock,
    body: 'We use reasonable technical and organizational safeguards to protect user information. No online service can guarantee perfect security, so users should keep their account credentials private.',
  },
  {
    title: 'Your Choices',
    icon: ShieldCheck,
    body: 'You remain in control. You can update profile information, adjust alerts, change study plans, disable camera support, and request account help or deletion by contacting the FocusSpark team.',
  },
  {
    title: 'Contact',
    icon: Mail,
    body: 'For privacy questions, requests, or concerns, contact us at focussparkai@gmail.com.',
  },
];

export function PrivacyPage() {
  return (
    <div className="pt-16">
      <section className="py-20 px-6 lg:px-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6 max-w-5xl mx-auto"
          >
            Privacy <span className="gradient-text">Policy</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            FocusSpark is built for students, so privacy should be clear. This page explains
            what information we use, how focus features work, and how you stay in control.
          </motion.p>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {privacySections.map((section, index) => {
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
            <h2 className="text-3xl mb-4">Policy Updates</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Privacy is necessary for responsible focus support, especially when optional
              camera-based features are involved. We may update this policy as FocusSpark grows,
              and the latest version will remain available here.
            </p>
          </div>
          <p className="mt-12 text-right text-sm text-muted-foreground">Last updated: June 14, 2026</p>
        </div>
      </section>
    </div>
  );
}
