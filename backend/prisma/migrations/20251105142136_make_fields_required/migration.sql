/*
  Warnings:

  - Made the column `horario` on table `Agendamento` required. This step will fail if there are existing NULL values in that column.
  - Made the column `observacoes` on table `Agendamento` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Agendamento` MODIFY `horario` VARCHAR(191) NOT NULL,
    MODIFY `observacoes` VARCHAR(191) NOT NULL;
