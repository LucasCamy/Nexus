import { SectionHeading } from "../ui/SectionHeading";
import { AnomalyForecast } from "./capabilities/AnomalyForecast";
import { ConfidencePanel } from "./capabilities/ConfidencePanel";
import { DependencyTrace } from "./capabilities/DependencyTrace";
import { WorkflowRunner } from "./capabilities/WorkflowRunner";

/**
 * Four capabilities, four different instruments. Grid has exactly four cells:
 * lg: [trace 7x2][forecast 5] / [trace][workflow 5] / [confidence 12]
 */
export function Capabilities() {
  return (
    <section id="plataforma" aria-labelledby="platform-title" className="relative border-t border-line bg-bg-raised py-24 md:py-36">
      <div className="container-x">
        <SectionHeading
          id="platform-title"
          title={
            <>
              Feito para responder às perguntas
              <br className="hidden md:block" /> que todo incidente faz primeiro.
            </>
          }
          lead="Do que isso depende? O que está prestes a quebrar? O que deve acontecer agora? Quem pode desfazer?"
        />

        <div className="mt-14 grid grid-flow-dense grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
          <div className="md:col-span-2 lg:col-span-7 lg:row-span-2">
            <DependencyTrace />
          </div>
          <div className="lg:col-span-5">
            <AnomalyForecast />
          </div>
          <div className="lg:col-span-5">
            <WorkflowRunner />
          </div>
          <div className="md:col-span-2 lg:col-span-12">
            <ConfidencePanel />
          </div>
        </div>
      </div>
    </section>
  );
}
