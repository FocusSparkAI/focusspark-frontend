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
    toast.success('Message sent! We\'ll get back to you soon.');
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
            className="text-5xl lg:text-6xl text-center mb-6"
          >
            Get in touch with the{' '}
            <span className="gradient-text">FocusSpark Team</span>
          </motion.h1>
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
                      href="mailto:hello@focusspark.ai" 
                      className="text-muted-foreground hover:text-blue-400 transition-colors"
                    >
                      hello@focusspark.ai
                    </a>
                  </div>
                </div>

                <div className="pt-8">
                  <h4 className="mb-4">Follow Us</h4>
                  <div className="flex gap-4">
                    {['LinkedIn', 'Twitter', 'YouTube'].map((platform) => (
                      <Button
                        key={platform}
                        variant="outline"
                        className="hover:bg-blue-500/10 hover:border-blue-500 transition-all"
                      >
                        {platform}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-card border border-border rounded-2xl p-8 glow-blue-purple"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block mb-2">
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
                  <label htmlFor="email" className="block mb-2">
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
                  <label htmlFor="message" className="block mb-2">
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
                    rows={6}
                    className="bg-background/50 border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
