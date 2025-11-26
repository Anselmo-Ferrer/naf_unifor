-- DropForeignKey
ALTER TABLE `Agendamento` DROP FOREIGN KEY `Agendamento_usuarioId_fkey`;

-- DropIndex
DROP INDEX `Agendamento_usuarioId_fkey` ON `Agendamento`;

-- AddForeignKey
ALTER TABLE `Agendamento` ADD CONSTRAINT `Agendamento_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
