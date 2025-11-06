'use client'

import { useRouter } from 'next/navigation';
import { Monitor, Laptop, Smartphone, FileText, ChartColumnBigIcon, NotebookText, LucideShoppingBag, Star } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();

  const stats = [
    {
      title: "Atendimentos Realizados",
      value: "+ de 4 mil atendimentos",
      description: "Atendimento gratuito em parcerias contábeis e fiscais para a comunidade.",
      icon: <ChartColumnBigIcon color='#044CF4' size={40}/>,
    },
    {
      title: "Declaração de IRPF",
      value: "+ de 1 mil",
      description: "Apoio completo no preenchimento e envio do documento do Imposto de Renda.",
      icon: <NotebookText color='#044CF4' size={40}/>,
    },
    {
      title: "MEIs regularizados",
      value: "600",
      description: "Orientação e suporte para abertura e regularização de MEI.",
      icon: <LucideShoppingBag color='#044CF4' size={40}/>,
    },
    {
      title: "Ações diferenciadas",
      value: "",
      description: "Ações que fortalecem a qualidade do atendimento e a integração com os fiscais.",
      icon: <Star color='#044CF4' size={40}/>,
    },
  ];

  const services = [
    {
      title: "Orientação para emissão do CNPJ",
      description: "Apoio na tutela e fornecemos de novos negócios.",
      Icon: Monitor,
    },
    {
      title: "Regularização do MEI",
      description: "Suporte para regularizar e manter o MEI em dia.",
      Icon: Laptop,
    },
    {
      title: "Declaração do Imposto de Renda Pessoa Física (IRPF)",
      description: "Auxílio no preenchimento e envio da declaração.",
      Icon: Smartphone,
    },
    {
      title: "Suporte fiscal em geral (Receita Federal, Sefaz e Sefin)",
      description: "Orientação sobre serviços e dúvidas junto às três fiscais.",
      Icon: FileText,
    },
  ];

  const navegarPara = (rota: string) => {
    router.push(rota);
  };

  const scrollPara = (id: string) => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href='/' className="text-xl font-bold text-blue-600">NAF Unifor</Link>
          <nav className="flex items-center gap-4">
            <button
              onClick={() => navegarPara('/agendamentos')}
              className="text-sm text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
            >
              Agendamento
            </button>
            <button
              onClick={() => navegarPara('/entrar')}
              className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Entrar
            </button>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-6 leading-tight">
                  Serviços Contábeis e Fiscais da Unifor
                </h1>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  O Núcleo de Apoio Contábil e Fiscal (NAF) da Unifor oferece orientação especializada em serviços da Receita Federal, assuntos tributários e orientações para alunos suplementaristas. O NAF é referência na Nordeste para qualidade e compromisso com a população.
                </p>
                <button
                  onClick={() => navegarPara('/agendamentos')}
                  className="bg-blue-600 text-white px-6 cursor-pointer py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Agendar atendimento
                </button>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-md h-80 rounded-lg overflow-hidden">
                  <img 
                    src="/AtendimentoNAF800.png" 
                    alt="Atendimento NAF Unifor" 
                    className="w-full h-full object-cover hover:scale-103 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-4">Sobre</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Criado em 2014, o Núcleo de Apoio Contábil e Fiscal (NAF) promove atendimento gratuito à população, além da capacitação, palestras e atividades que fortalecem a relação entre Universidade e Fisco.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="border border-gray-200 bg-white rounded-lg p-6 flex gap-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{stat.title}</h3>
                    {stat.value && (
                      <p className="text-blue-600 font-semibold text-xl mb-2">{stat.value}</p>
                    )}
                    <p className="text-sm text-gray-600">{stat.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 flex items-center justify-center text-4xl">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-4">Nossos Serviços</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                O NAF oferece atendimento contábil e fiscal gratuito, auxiliando contribuintes e MEIs no cumprimento dos principais fiscais. Conheça os serviços disponíveis para ajudar você com segurança e responsabilidade:
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="border border-gray-200 bg-white rounded-lg p-6 flex gap-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                      <service.Icon className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-2">{service.title}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LOCATION */}
        <section id="agendamento" className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-4">Localização</h2>
              <p className="text-gray-600">
                Av. Washington Soares, 1321 - Edson Queiroz - CEP 60811-905<br />
                Fortaleza / CE - Brasil, Bloco B | Sala 1A | Sob. agendamento
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.286236706373!2d-38.476856!3d-3.774214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7c748f2b0f8f0f9%3A0x5f7f7f7f7f7f7f7f!2sUniversidade%20de%20Fortaleza%20-%20UNIFOR!5e0!3m2!1sen!2sbr!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Localização NAF Unifor"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <p className="text-sm text-gray-800 font-semibold">NAF Unifor</p>
          <button
            onClick={() => navegarPara('/agendamentos')}
            className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
          >
            Agendamento
          </button>
        </div>
      </footer>
    </div>
  );
}