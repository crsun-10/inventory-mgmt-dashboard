import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/auth-guard';


const appRoutes: Routes = [
  // {
  //   path: 'apps',
  //   loadChildren: './main/apps/apps.module#AppsModule',
  //   canActivate: [AuthGuard]
  // },
  { path: 'authentication', loadChildren: './main/authentication/authentication.module#AuthenticationModule' },
  // {
  //   path: 'pages',
  //   loadChildren: './main/pages/pages.module#PagesModule'
  // },
  // {
  //   path: 'ui',
  //   loadChildren: './main/ui/ui.module#UIModule'
  // },
  // {
  //   path: 'documentation',
  //   loadChildren: './main/documentation/documentation.module#DocumentationModule'
  // },
  // {
  //   path: 'angular-material-elements',
  //   loadChildren: './main/angular-material-elements/angular-material-elements.module#AngularMaterialElementsModule'
  // },
  {
    path: 'inventory',
    loadChildren: './main/inventory/inventory.module#InventoryModule',
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'inventory/main'
  }
];

// const appRoutes: Routes = [
//   { path: '', redirectTo: 'games/category/today', pathMatch: 'full' },
//   { path: 'authentication', loadChildren: './main/authentication/authentication.module#AuthenticationModule' },
//   { path: 'pages', loadChildren: './main/pages/pages.module#PagesModule', canActivate: [AuthGuard] },
//   { path: 'games', loadChildren: './main/games/games.module#GamesModule', canActivate: [AuthGuard] },
//   { path: '**', redirectTo: 'games/category/today' }
// ];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
