<?php

namespace Database\Seeders;

use App\Models\Article;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $articles = [
            [
                'title' => 'Panduan Lengkap Visa Tokutei Ginou (SSW) 2026: Syarat dan Jalur Resmi',
                'slug' => 'panduan-lengkap-visa-tokutei-ginou-ssw-2026',
                'excerpt' => 'Pelajari secara komprehensif apa itu visa keahlian khusus (SSW), syarat kemampuan bahasa Jepang N4/JFT-Basic, dan tahapan ujian evaluasi keterampilan industri.',
                'content' => "Visa Specified Skilled Worker (SSW) atau Tokutei Ginou merupakan jalur resmi bagi tenaga kerja terampil internasional untuk berkarier di Jepang. Program ini mencakup berbagai sektor penting seperti keperawatan lansia (Kaigo), pengolahan makanan, manufaktur, dan pertanian.\n\n### Langkah Memulai Persiapan di LPK Lombok Shorai Rinjani\nKunci keberhasilan lolos seleksi SSW terletak pada kedisiplinan belajar bahasa sejak dini. Di LPK Lombok Shorai Rinjani, kurikulum dirancang terpadu antara pembelajaran gramatika N4 intensif dan simulasi soal teknis Prometric sehingga siswa siap tempur saat jendela ujian dibuka.",
                'cover_image' => 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
                'thumbnail' => 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
                'author' => 'Tim Litbang LPK Lombok Shorai Rinjani',
                'category' => 'Panduan Karier',
                'tags' => ['Tokutei Ginou', 'SSW', 'Visa Kerja', 'Jepang 2026'],
                'read_time' => '5 Menit',
                'status' => 'PUBLISHED',
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => 'Mengenal Etos Kerja Hou-Ren-So: Kunci Komunikasi Profesional di Industri Jepang',
                'slug' => 'mengenal-etos-kerja-hou-ren-so-industri-jepang',
                'excerpt' => 'Mengapa prinsip Houkoku (Lapor), Renraku (Informasi), dan Soudan (Konsultasi) sangat krusial bagi keberhasilan adaptasi pekerja asing di tempat kerja Jepang?',
                'content' => "Bekerja di Jepang bukan hanya soal keterampilan fisik dan kemampuan percakapan, tetapi juga pemahaman mendalam tentang tata nilai dan komunikasi kerja organisasi. Prinsip Hou-Ren-So adalah pilar fundamental etika profesional di setiap perusahaan Jepang.\n\nBerikut 3 pilar yang wajib dikuasai:\n1. **Houkoku (Lapor)**: Melaporkan perkembangan tugas secara berkala tanpa menunggu ditanya atasan.\n2. **Renraku (Informasi)**: Berbagi informasi yang relevan kepada rekan satu tim dengan cepat dan faktual.\n3. **Soudan (Konsultasi)**: Berdiskusi atau meminta saran saat menghadapi keraguan atau potensi kendala sebelum masalah membesar.",
                'cover_image' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
                'thumbnail' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
                'author' => 'Tim Litbang LPK Lombok Shorai Rinjani',
                'category' => 'Budaya & Etika Kerja',
                'tags' => ['Hourenso', 'Etos Kerja', 'Budaya Jepang', 'Profesional'],
                'read_time' => '6 Menit',
                'status' => 'PUBLISHED',
                'published_at' => now()->subDays(12),
            ],
            [
                'title' => 'Strategi Efektif Menguasai 100 Kanji Pertama untuk Pemula Bahasa Jepang',
                'slug' => 'strategi-efektif-menguasai-100-kanji-pertama-pemula',
                'excerpt' => 'Tips sistematis menghafal guratan kanji dasar, memahami perbedaan Onyomi dan Kunyomi, serta teknik mengingat asosiasi radikal secara efisien.',
                'content' => "Bagi pemula, kanji kerap menjadi tantangan terbesar dalam mempelajari bahasa Jepang. Namun dengan pendekatan pemahaman radikal dan konteks kalimat nyata, menghafal 100 kanji pertama level JLPT N5 dapat dicapai dalam waktu 4 hingga 6 pekan dengan latihan konsisten.\n\nFokuslah pada kanji angka, hari, arah mata angin, serta elemen alam sebelum melangkah ke kanji majemuk yang lebih rumit.",
                'cover_image' => 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1200&q=80',
                'thumbnail' => 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=600&q=80',
                'author' => 'Tim Litbang LPK Lombok Shorai Rinjani',
                'category' => 'Tips Belajar',
                'tags' => ['Kanji', 'N5', 'Tips Bahasa', 'Metode Belajar'],
                'read_time' => '4 Menit',
                'status' => 'PUBLISHED',
                'published_at' => now()->subDays(18),
            ],
        ];

        $author = \App\Models\User::where('email', 'admin@example.test')->first()
            ?: \App\Models\User::where('role', \App\Models\User::ROLE_ADMIN)->first();

        foreach ($articles as $item) {
            $item['author_id'] = $author ? $author->id : null;
            $item['featured_image'] = $item['cover_image'] ?? null;
            Article::updateOrCreate(
                ['slug' => $item['slug']],
                $item
            );
        }
    }
}
