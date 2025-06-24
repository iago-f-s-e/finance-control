export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Finance Control
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Gerencie suas finanças pessoais de forma inteligente
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <div className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">💰 Receitas</h2>
            <p className="text-muted-foreground">
              Cadastre e gerencie suas receitas mensais e eventuais
            </p>
          </div>
          <div className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">💸 Despesas</h2>
            <p className="text-muted-foreground">
              Controle seus gastos e organize por categorias
            </p>
          </div>
          <div className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">📊 Analytics</h2>
            <p className="text-muted-foreground">
              Visualize seus dados e tome decisões informadas
            </p>
          </div>
        </div>
      </div>
    </main>
  )
} 