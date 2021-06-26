import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccountingComponent } from './accounting/accounting.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LightningModule } from 'lightning';

const LIBRARIES = [
  LightningModule
]

@NgModule({
  declarations: [
    AppComponent,
    AccountingComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    BrowserAnimationsModule,
    ...LIBRARIES
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
