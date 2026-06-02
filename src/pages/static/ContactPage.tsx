import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Send } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = encodeURIComponent(`FocusSpark message from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );

    window.location.href = `mailto:focussparkai@gmail.com?subject=${subject}&body=${body}`;
    toast.success('Opening your email app with your message ready to send.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="py-20 px-6 lg:px-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl leading-tight text-center mb-6 max-w-5xl mx-auto"
          >
            Get in touch with the{' '}
            <span className="gradient-text">FocusSpark Team</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed"
          >
            Questions, feedback, or collaboration ideas? Send us a message and
            your email app will open with everything ready to go.
          </motion.p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left - Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl mb-6">
                We'd love to hear from you
              </h2>

              <p className="text-xl text-muted-foreground mb-8">
                Have questions about FocusSpark? Want to share feedback?
                We're here to help and always excited to connect with our community.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="mb-1">Email Us</h4>
                    <a
                      href="mailto:focussparkai@gmail.com"
                      className="text-muted-foreground hover:text-blue-400 transition-colors"
                    >
                      focussparkai@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-card border border-border rounded-2xl glow-blue-purple"
              style={{ padding: 'clamp(20px, 4vw, 32px)' }}
            >
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Your name"
                    required
                    className="bg-background/50 border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your.email@example.com"
                    required
                    className="bg-background/50 border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block mb-2 text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Tell us what's on your mind..."
                    required
                    rows={5}
                    className="min-h-28 bg-background/50 border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none sm:min-h-36"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send via Email
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
