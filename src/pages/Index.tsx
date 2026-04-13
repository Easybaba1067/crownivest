import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { useProperties } from "@/hooks/useProperties";
import { ArrowRight, Shield, TrendingUp, Users, Building2, Star, CheckCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

const testimonials = [
  {
    name: "Sarah Mitchell", role: "Real Estate Investor",
    quote: "Crowninvext made it possible for me to diversify into commercial real estate without millions in capital. My portfolio has grown 18% in two years.", rating: 5,
  },
  {
    name: "James Rodriguez", role: "Tech Professional",
    quote: "I started with just $500 and now I earn passive rental income from three different properties. The platform is incredibly transparent.", rating: 5,
  },
  {
    name: "Emily Chen", role: "Financial Advisor",
    quote: "I recommend Crowninvext to my clients looking for alternative investments. The due diligence on each property is thorough and the returns are consistent.", rating: 5,
  },
];

const trustSignals = [
  { label: "SEC Compliant", icon: Shield },
  { label: "Bank-Grade Security", icon: CheckCircle },
  { label: "Audited Financials", icon: CheckCircle },
  { label: "Investor Protection", icon: Shield },
];

const Index = () => {
  const { properties } = useProperties();
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const stats = [
    { label: "Total Invested", value: "$24M+", icon: TrendingUp },
    { label: "Active Investors", value: "2,400+", icon: Users },
    { label: "Properties Funded", value: "38", icon: Building2 },
    { label: "Avg. ROI", value: "11.5%", icon: Shield },
  ];

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Message sent! We'll get back to you shortly.");
    setContactName(""); setContactEmail(""); setContactMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-32 pb-20 overflow-hidden bg-surface">
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6 text-foreground">
              Invest in <span className="text-gold-gradient">Premium</span> Real Estate
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Own fractions of high-yield properties through crowdfunding. Start investing with as little as $250 and earn passive rental income.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="gold" size="lg" asChild>
                <Link to="/properties">Invest Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button variant="gold-outline" size="lg" asChild>
                <a href="#contact">Contact Us</a>
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 mt-10">
              {trustSignals.map((signal) => (
                <div key={signal.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <signal.icon className="h-4 w-4 text-primary" />
                  <span>{signal.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-y border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-display font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold">Featured Properties</h2>
              <p className="text-muted-foreground mt-2">Curated investment opportunities</p>
            </div>
            <Button variant="gold-outline" asChild>
              <Link to="/properties">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, 3).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          {properties.length === 0 && (
            <p className="text-center text-muted-foreground py-10">No properties available yet.</p>
          )}
        </div>
      </section>

      <section className="py-20 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Create Account", desc: "Sign up and complete your investor profile in minutes." },
              { step: "02", title: "Choose Properties", desc: "Browse curated real estate opportunities and pick your investments." },
              { step: "03", title: "Earn Returns", desc: "Receive rental income and benefit from property appreciation." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full gradient-gold flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-lg">{item.step}</div>
                <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-4">What Our Investors Say</h2>
          <p className="text-muted-foreground text-center mb-12">Trusted by thousands of investors worldwide</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <Card key={t.name} className="bg-card border-border hover:border-primary/20 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-4">Contact Us</h2>
            <p className="text-muted-foreground text-center mb-8">Have questions? We'd love to hear from you.</p>
            <form onSubmit={handleContact} className="space-y-4">
              <Input placeholder="Your Name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
              <Input type="email" placeholder="Your Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              <Textarea placeholder="Your Message" rows={4} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} />
              <Button variant="gold" className="w-full" type="submit">
                <Mail className="h-4 w-4 mr-2" /> Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
