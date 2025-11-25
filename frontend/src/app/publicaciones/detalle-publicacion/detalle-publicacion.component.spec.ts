import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePublicacionComponent } from './detalle-publicacion.component';

describe('DetallePublicacionComponent', () => {
  let component: DetallePublicacionComponent;
  let fixture: ComponentFixture<DetallePublicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePublicacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallePublicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
