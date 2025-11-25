import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoPublicacionesComponent } from './listado-publicaciones.component';

describe('ListadoPublicacionesComponent', () => {
  let component: ListadoPublicacionesComponent;
  let fixture: ComponentFixture<ListadoPublicacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoPublicacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoPublicacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
