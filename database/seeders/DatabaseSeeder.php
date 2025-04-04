<?php

namespace Database\Seeders;

use App\Models\Listing;
use App\Models\Tag;
use App\Models\Type;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
        {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

            // Create types first
            $types = Type::factory(10)->create();

            // Create tags
            $tags = Tag::factory(20)->create();

            // Create listings with types and tags
            Listing::factory(5)
                ->recycle($types)
                ->create()
                ->each(function ($listing) use ($tags) {
                    $listing->tags()->attach(
                        $tags->random(rand(2, 5))->pluck('id')->toArray()
                    );
                });
        }
}
