<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260917114000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Link CRM follow-up tasks to an explicit job offer when the user chooses an opportunity.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE crm_follow_up_task ADD job_offer_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE crm_follow_up_task ADD CONSTRAINT FK_CRM_FOLLOW_UP_JOB_OFFER FOREIGN KEY (job_offer_id) REFERENCES job_offer (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX idx_crm_follow_up_job_offer ON crm_follow_up_task (job_offer_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE crm_follow_up_task DROP CONSTRAINT FK_CRM_FOLLOW_UP_JOB_OFFER');
        $this->addSql('DROP INDEX idx_crm_follow_up_job_offer');
        $this->addSql('ALTER TABLE crm_follow_up_task DROP job_offer_id');
    }
}
