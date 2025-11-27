-- DropForeignKey
ALTER TABLE "public"."Agendamento" DROP CONSTRAINT "Agendamento_servicoId_fkey";

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
