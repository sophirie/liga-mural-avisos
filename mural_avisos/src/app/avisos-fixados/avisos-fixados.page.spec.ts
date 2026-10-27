import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvisosFixadosPage } from './avisos-fixados.page';

describe('AvisosFixadosPage', () => {
  let component: AvisosFixadosPage;
  let fixture: ComponentFixture<AvisosFixadosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AvisosFixadosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
