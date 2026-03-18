import { ArrowLeft, MapPin, Heart, Shield, Star, Package, Users, Zap, Mail, Phone, Clock } from 'lucide-react';
import { useStore } from '../context/store';

export default function AboutPage() {
  const { navigateTo } = useStore();

  const team = [
    { name: 'João Carlos', role: 'CEO & Fundador', emoji: '👨‍💼', bio: 'Empreendedor craibense com mais de 10 anos em e-commerce.' },
    { name: 'Ana Souza', role: 'Diretora de Produtos', emoji: '👩‍💻', bio: 'Especialista em curadoria de produtos e qualidade.' },
    { name: 'Pedro Lima', role: 'Tech Lead', emoji: '👨‍🔧', bio: 'Desenvolvedor full-stack apaixonado por experiências incríveis.' },
    { name: 'Maria Costa', role: 'Atendimento', emoji: '👩‍💼', bio: 'Garantindo que cada cliente seja tratado com amor.' },
  ];

  const values = [
    { icon: <Heart className="w-5 h-5" />, title: 'Paixão Local', desc: 'Nascemos em Craibas e amamos nossa cidade. Cada venda apoia a economia local.', color: 'bg-red-50 text-red-500' },
    { icon: <Shield className="w-5 h-5" />, title: 'Confiança Total', desc: 'Produtos 100% originais com garantia do fabricante e compra protegida.', color: 'bg-green-50 text-green-500' },
    { icon: <Zap className="w-5 h-5" />, title: 'Entrega Rápida', desc: 'Do nosso estoque pra sua casa o mais rápido possível, sempre no prazo.', color: 'bg-yellow-50 text-yellow-500' },
    { icon: <Star className="w-5 h-5" />, title: 'Qualidade Premium', desc: 'Curadoria rigorosa — só o que vale a pena entra no Mercado Craibas.', color: 'bg-blue-50 text-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="bg-white border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center gap-3">
          <button onClick={() => navigateTo('home')} className="p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-bold text-surface-900 text-xl">Sobre Nós</h1>
            <p className="text-surface-400 text-xs">Nossa história e valores</p>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#09090b] to-[#18181b] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #f97316, transparent 50%), radial-gradient(circle at 80% 20%, #3b82f6, transparent 50%)' }} />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto mb-5 shadow-brand-lg">
            <span className="text-white font-display font-bold text-2xl">MC</span>
          </div>
          <h2 className="font-display font-bold text-white text-4xl md:text-5xl tracking-tight mb-4">
            Feito com ❤️ em Craibas
          </h2>
          <p className="text-white/60 font-body text-lg leading-relaxed max-w-2xl mx-auto">
            Somos uma startup local que acredita no poder do comércio digital para transformar a vida das pessoas. Nascemos em Craibas-AL para trazer os melhores produtos do mercado para a sua porta.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '2022', label: 'Fundação', icon: <Clock className="w-5 h-5 text-brand-500" /> },
            { value: '500+', label: 'Produtos', icon: <Package className="w-5 h-5 text-blue-500" /> },
            { value: '3.000+', label: 'Clientes', icon: <Users className="w-5 h-5 text-green-500" /> },
            { value: '4.9 ★', label: 'Avaliação', icon: <Star className="w-5 h-5 text-amber-500" /> },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-surface-100 p-6 text-center shadow-soft">
              <div className="flex justify-center mb-3">{s.icon}</div>
              <p className="font-display font-bold text-surface-900 text-3xl">{s.value}</p>
              <p className="text-surface-400 text-sm font-body mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="bg-white rounded-3xl border border-surface-100 p-8 md:p-10 shadow-soft">
          <h3 className="font-display font-bold text-surface-900 text-2xl mb-4">Nossa História</h3>
          <div className="space-y-4 text-surface-600 font-body text-sm leading-relaxed">
            <p>O Mercado Craibas nasceu de uma ideia simples: trazer a comodidade do e-commerce para o interior de Alagoas. Em 2022, um grupo de empreendedores locais se reuniu com o objetivo de criar uma plataforma que unisse produtos de qualidade com preços justos e entrega rápida na região.</p>
            <p>Começamos com apenas 20 produtos. Hoje temos mais de 500 itens cuidadosamente selecionados — desde os mais avançados smartphones até as famosas garrafas Stanley que viraram febre no Brasil inteiro.</p>
            <p>Nossa missão é simples: ser a loja de confiança da sua família, oferecendo sempre produtos originais, atendimento humano e a melhor experiência de compra online do interior nordestino.</p>
          </div>
        </div>

        {/* Values */}
        <div>
          <h3 className="font-display font-bold text-surface-900 text-2xl mb-6 text-center">Nossos Valores</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl border border-surface-100 p-6 shadow-soft flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl ${v.color} flex items-center justify-center flex-shrink-0`}>
                  {v.icon}
                </div>
                <div>
                  <h4 className="font-display font-bold text-surface-800 text-base mb-1">{v.title}</h4>
                  <p className="text-surface-500 font-body text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h3 className="font-display font-bold text-surface-900 text-2xl mb-6 text-center">Nossa Equipe</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {team.map((member, i) => (
              <div key={i} className="bg-white rounded-2xl border border-surface-100 p-5 text-center shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all">
                <div className="text-4xl mb-3">{member.emoji}</div>
                <h4 className="font-display font-bold text-surface-800 text-sm">{member.name}</h4>
                <p className="text-brand-500 text-xs font-semibold mb-2">{member.role}</p>
                <p className="text-surface-400 text-xs font-body leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-8 text-center text-white relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full" />
          <h3 className="font-display font-bold text-2xl mb-2 relative">Entre em Contato</h3>
          <p className="text-white/80 font-body text-sm mb-6 relative">Estamos sempre prontos para ajudar você!</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
            {[
              { icon: <Phone className="w-4 h-4" />, label: '(82) 99999-9999' },
              { icon: <Mail className="w-4 h-4" />, label: 'contato@mcraibas.com' },
              { icon: <MapPin className="w-4 h-4" />, label: 'Craibas, AL' },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/20">
                {c.icon}
                <span className="text-sm font-body">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
