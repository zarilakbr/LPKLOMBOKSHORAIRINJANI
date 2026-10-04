<?php

namespace App\Console\Commands;

use App\Models\PermissionAttachment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MigratePermissionAttachmentsToPrivate extends Command
{
    protected $signature = 'attachments:migrate-permissions-private';
    protected $description = 'Safely migrate existing permission attachments from public disk to private storage.';

    public function handle(): int
    {
        $this->info('Starting migration of permission attachments to private storage...');

        $attachments = PermissionAttachment::all();
        $this->info("Found {$attachments->count()} permission attachment records in database.");

        $migratedCount = 0;
        $alreadyPrivateCount = 0;
        $missingCount = 0;

        foreach ($attachments as $att) {
            $path = $att->file_path;
            $publicDisk = Storage::disk('public');
            $privateDisk = Storage::disk('local');

            $inPublic = $publicDisk->exists($path);
            $inPrivate = $privateDisk->exists($path);

            if ($inPublic && !$inPrivate) {
                // Copy to private storage
                $content = $publicDisk->get($path);
                $privateDisk->put($path, $content);

                // Verify file size
                $privateSize = $privateDisk->size($path);
                if ($privateSize === strlen($content)) {
                    // Remove from public disk
                    $publicDisk->delete($path);
                    $this->line("  [MIGRATED] ID {$att->id}: {$path} (" . number_format($privateSize) . " bytes)");
                    Log::info("Permission attachment ID {$att->id} migrated to private storage: {$path}");
                    $migratedCount++;
                } else {
                    $this->error("  [ERROR] File size mismatch for ID {$att->id}. Kept on public disk for safety.");
                    Log::error("Failed to migrate attachment ID {$att->id}: file size mismatch.");
                }
            } elseif ($inPrivate) {
                // Already in private storage
                if ($inPublic) {
                    // Clean up duplicate from public disk
                    $publicDisk->delete($path);
                    $this->line("  [CLEANED] Removed leftover public copy for ID {$att->id}: {$path}");
                }
                $alreadyPrivateCount++;
            } else {
                // Not found on either disk (e.g. demo/seed record)
                $this->warn("  [WARNING] Physical file not found for ID {$att->id}: {$path}");
                Log::warning("Permission attachment ID {$att->id} physical file not found on disk: {$path}");
                $missingCount++;
            }
        }

        $this->info("Migration completed.");
        $this->info("Migrated: {$migratedCount} | Already Private: {$alreadyPrivateCount} | Missing: {$missingCount}");

        return Command::SUCCESS;
    }
}
