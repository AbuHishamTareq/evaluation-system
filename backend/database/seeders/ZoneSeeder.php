<?php

namespace Database\Seeders;

use App\Models\Zone;
use Illuminate\Database\Seeder;

class ZoneSeeder extends Seeder
{
    public function run(): void
    {
        $regions = [
            ['name' => 'Northern Region', 'code' => 'NR', 'level' => 'region', 'description' => 'Northern administrative region'],
            ['name' => 'Southern Region', 'code' => 'SR', 'level' => 'region', 'description' => 'Southern administrative region'],
            ['name' => 'Eastern Region', 'code' => 'ER', 'level' => 'region', 'description' => 'Eastern administrative region'],
            ['name' => 'Western Region', 'code' => 'WR', 'level' => 'region', 'description' => 'Western administrative region'],
            ['name' => 'Central Region', 'code' => 'CR', 'level' => 'region', 'description' => 'Central administrative region'],
        ];

        $createdRegions = [];

        foreach ($regions as $region) {
            $createdRegions[$region['code']] = Zone::firstOrCreate(
                ['code' => $region['code']],
                $region
            );
        }

        // Create districts for each region
        $districts = [
            ['name' => 'North District 1', 'code' => 'ND1', 'parent_code' => 'NR', 'level' => 'district'],
            ['name' => 'North District 2', 'code' => 'ND2', 'parent_code' => 'NR', 'level' => 'district'],
            ['name' => 'South District 1', 'code' => 'SD1', 'parent_code' => 'SR', 'level' => 'district'],
            ['name' => 'South District 2', 'code' => 'SD2', 'parent_code' => 'SR', 'level' => 'district'],
            ['name' => 'East District 1', 'code' => 'ED1', 'parent_code' => 'ER', 'level' => 'district'],
            ['name' => 'East District 2', 'code' => 'ED2', 'parent_code' => 'ER', 'level' => 'district'],
            ['name' => 'West District 1', 'code' => 'WD1', 'parent_code' => 'WR', 'level' => 'district'],
            ['name' => 'West District 2', 'code' => 'WD2', 'parent_code' => 'WR', 'level' => 'district'],
            ['name' => 'Central District 1', 'code' => 'CD1', 'parent_code' => 'CR', 'level' => 'district'],
            ['name' => 'Central District 2', 'code' => 'CD2', 'parent_code' => 'CR', 'level' => 'district'],
        ];

        $createdDistricts = [];

        foreach ($districts as $district) {
            $parentId = $createdRegions[$district['parent_code']]->id ?? null;

            if ($parentId) {
                $createdDistricts[$district['code']] = Zone::firstOrCreate(
                    ['code' => $district['code']],
                    [
                        'name' => $district['name'],
                        'code' => $district['code'],
                        'parent_id' => $parentId,
                        'level' => $district['level'],
                    ]
                );
            }
        }

        // Create sub-districts
        $subDistricts = [
            ['name' => 'North Sub-District 1A', 'code' => 'NSD1A', 'parent_code' => 'ND1', 'level' => 'sub_district'],
            ['name' => 'North Sub-District 1B', 'code' => 'NSD1B', 'parent_code' => 'ND1', 'level' => 'sub_district'],
            ['name' => 'South Sub-District 1A', 'code' => 'SSD1A', 'parent_code' => 'SD1', 'level' => 'sub_district'],
            ['name' => 'South Sub-District 1B', 'code' => 'SSD1B', 'parent_code' => 'SD1', 'level' => 'sub_district'],
            ['name' => 'East Sub-District 1A', 'code' => 'ESD1A', 'parent_code' => 'ED1', 'level' => 'sub_district'],
            ['name' => 'West Sub-District 1A', 'code' => 'WSD1A', 'parent_code' => 'WD1', 'level' => 'sub_district'],
            ['name' => 'Central Sub-District 1A', 'code' => 'CSD1A', 'parent_code' => 'CD1', 'level' => 'sub_district'],
            ['name' => 'Central Sub-District 1B', 'code' => 'CSD1B', 'parent_code' => 'CD1', 'level' => 'sub_district'],
        ];

        foreach ($subDistricts as $subDistrict) {
            $parentId = $createdDistricts[$subDistrict['parent_code']]->id ?? null;

            if ($parentId) {
                Zone::firstOrCreate(
                    ['code' => $subDistrict['code']],
                    [
                        'name' => $subDistrict['name'],
                        'code' => $subDistrict['code'],
                        'parent_id' => $parentId,
                        'level' => $subDistrict['level'],
                    ]
                );
            }
        }
    }
}
