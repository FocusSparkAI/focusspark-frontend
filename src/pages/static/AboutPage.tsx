import { motion } from 'motion/react';
import { Target, Eye, Code, Palette, Rocket, Microscope, Layers3, Wrench } from 'lucide-react';

const teamMembers = [
  {
    name: 'Mohammad Rayan',
    title: 'Project Lead & Backend Architect',
    bio: 'Led project architecture and technical decisions. Developed the backend, database, APIs, authentication, and AI integrations.',
    icon: Code,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Hamza Naseer',
    title: 'Product Designer',
    bio: 'Proposed the project concept and designed the Chrome Extension and Web Dashboard in Figma, shaping the product experience and visual design.',
    icon: Palette,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Abdul Wahab Subhani',
    title: 'System & Integration Engineer',
    bio: 'Contributed to system design, API integration, technical research, solution prototyping, and troubleshooting.',
    icon: Wrench,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Abdul Hanan',
    title: 'Full Stack Developer',
    bio: 'Contributed to frontend and backend development, implemented new features, resolved technical issues, and improved application stability.',
    icon: Layers3,
    gradient: 'from-green-500 to-teal-500',
  },
];

export function AboutPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="py-20 px-6 lg:px-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-6xl mb-6"
          >
            We're about making a{' '}
            <span className="gradient-text">positive impact</span>
          </motion.h1>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="bg-card border border-border rounded-2xl p-8 md:p-12 glow-blue-purple"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-3xl mb-4">Our Mission</h3>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our mission is to help students unlock their full academic potential 
              through intelligent, personalized learning tools that adapt to each 
              individual's unique learning style and pace.
            </p>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="bg-card border border-border rounded-2xl p-8 md:p-12 glow-teal"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-6">
              <Eye className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-3xl mb-4">Our Vision</h3>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              We aim for radical personalization through adaptive AI. We envision 
              a future where every student has access to world-class learning 
              experiences, powered by technology that truly understands them.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 lg:px-20 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl mb-4">
              Meet the <span className="gradient-text">Team</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Passionate experts dedicated to transforming education
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => {
              const Icon = member.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="relative bg-card border border-border rounded-2xl p-6 text-center cursor-pointer group overflow-hidden"
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Icon with gradient glow */}
                  <div className="relative mb-4 flex items-center justify-center">
                    <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                    <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  <h4 className="relative text-xl mb-1">{member.name}</h4>
                  
                  <p className="relative text-sm text-blue-500 mb-3">{member.title}</p>
                  
                  <p className="relative text-sm text-muted-foreground">{member.bio}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl mb-4">Our Core Values</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Student-First',
                description: 'Every decision we make prioritizes student success and well-being.',
                gradient: 'from-blue-500 to-purple-600',
              },
              {
                icon: Microscope,
                title: 'Science-Backed',
                description: 'We rely on research and data, not trends or assumptions.',
                gradient: 'from-teal-500 to-cyan-500',
              },
              {
                icon: Rocket,
                title: 'Innovation',
                description: 'We continuously push boundaries to deliver cutting-edge solutions.',
                gradient: 'from-orange-500 to-pink-500',
              },
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative text-center group"
                >
                  {/* Icon with gradient background */}
                  <div className="relative mb-6 flex items-center justify-center">
                    <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
                    <div className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center`}>
                      <Icon className="w-12 h-12 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  <h4 className="text-xl mb-2">{value.title}</h4>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
