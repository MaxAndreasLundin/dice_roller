import { DiceRoller } from "./Components/DiceRoller";
import Header from "./Components/Header";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
      <Header />
      <main className="pt-8 pb-16">
        <DiceRoller />
      </main>
    </div>
  );
}

export default App;
