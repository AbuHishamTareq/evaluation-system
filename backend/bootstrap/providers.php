<?php

use App\Providers\AppServiceProvider;
use App\Providers\CenterServiceProvider;
use App\Providers\ClassificationServiceProvider;
use App\Providers\ClinicAssignmentServiceProvider;
use App\Providers\DepartmentServiceProvider;
use App\Providers\EducationalDegreeServiceProvider;
use App\Providers\ProfessionalServiceProvider;
use App\Providers\QuestionCategoryServiceProvider;
use App\Providers\QuestionServiceProvider;
use App\Providers\QuestionSubCategoryServiceProvider;
use App\Providers\RolesAndPermissionsServiceProvider;
use App\Providers\StaffServiceProvider;
use App\Providers\TeamCodeServiceProvider;
use App\Providers\UserServiceProvider;
use App\Providers\ZoneServiceProvider;

return [
    AppServiceProvider::class,
    RolesAndPermissionsServiceProvider::class,
    ZoneServiceProvider::class,
    QuestionCategoryServiceProvider::class,
    QuestionSubCategoryServiceProvider::class,
    QuestionServiceProvider::class,
    CenterServiceProvider::class,
    ClinicAssignmentServiceProvider::class,
    TeamCodeServiceProvider::class,
    ClassificationServiceProvider::class,
    EducationalDegreeServiceProvider::class,
    DepartmentServiceProvider::class,
    ProfessionalServiceProvider::class,
    StaffServiceProvider::class,
    UserServiceProvider::class,
];
