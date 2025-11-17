/**
 * TEST 7: BUTTON COMPONENT - Pruebas para el componente Button reutilizable
 * 
 * Este archivo contiene pruebas unitarias para el componente Button,
 * verificando su renderizado, variantes, estados y comportamiento.
 */

import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../components/common/Button/Button';

describe('Button Component', () => {
  
  describe('Renderizado básico', () => {
    it('debe renderizar el botón con texto', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('debe renderizar sin children', () => {
      render(<Button />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('debe aplicar el tipo por defecto "button"', () => {
      render(<Button>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('debe aplicar el tipo especificado', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Variantes de estilo', () => {
    it('debe aplicar la variante primary por defecto', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('primary');
    });

    it('debe aplicar la variante secundaria', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('secondary');
    });

    it('debe aplicar la variante danger', () => {
      render(<Button variant="danger">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('danger');
    });
  });

  describe('Tamaños', () => {
    it('debe aplicar el tamaño medium por defecto', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('medium');
    });

    it('debe aplicar el tamaño small', () => {
      render(<Button size="small">Small</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('small');
    });

    it('debe aplicar el tamaño large', () => {
      render(<Button size="large">Large</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('large');
    });
  });

  describe('Estados', () => {
    it('debe deshabilitar el botón cuando disabled es true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('debe deshabilitar el botón cuando loading es true', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('debe mostrar spinner cuando está en loading', () => {
      const { container } = render(<Button loading>Loading</Button>);
      const spinner = container.querySelector('.spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('debe aplicar la clase loading cuando está cargando', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('loading');
    });

    it('no debe mostrar el icono cuando está en loading', () => {
      const icon = <span data-testid="icon">🎵</span>;
      const { queryByTestId } = render(
        <Button loading icon={icon}>Loading</Button>
      );
      expect(queryByTestId('icon')).not.toBeInTheDocument();
    });
  });

  describe('Iconos', () => {
    it('debe renderizar el icono cuando se proporciona', () => {
      const icon = <span data-testid="test-icon">🎵</span>;
      render(<Button icon={icon}>With Icon</Button>);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('debe renderizar el botón sin icono cuando no se proporciona', () => {
      const { container } = render(<Button>No Icon</Button>);
      const iconSpan = container.querySelector('.icon');
      expect(iconSpan).not.toBeInTheDocument();
    });

    it('debe renderizar icono y texto juntos', () => {
      const icon = <span data-testid="test-icon">🎵</span>;
      render(<Button icon={icon}>Play</Button>);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('Play')).toBeInTheDocument();
    });
  });

  describe('Eventos', () => {
    it('debe llamar onClick cuando se hace click', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('no debe llamar onClick cuando está deshabilitado', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Click me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('no debe llamar onClick cuando está en loading', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} loading>Click me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('debe pasar el evento al handler onClick', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('Clases personalizadas', () => {
    it('debe aplicar className adicional', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    it('debe combinar clases por defecto con personalizadas', () => {
      render(<Button className="custom-class" variant="secondary">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
      expect(button.className).toContain('secondary');
      expect(button.className).toContain('button');
    });
  });

  describe('Props adicionales', () => {
    it('debe pasar props adicionales al elemento button', () => {
      render(
        <Button data-testid="custom-button" aria-label="Custom Label">
          Test
        </Button>
      );
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('debe manejar múltiples props adicionales', () => {
      render(
        <Button 
          data-test="test" 
          aria-describedby="description"
          title="Button title"
        >
          Test
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-test', 'test');
      expect(button).toHaveAttribute('aria-describedby', 'description');
      expect(button).toHaveAttribute('title', 'Button title');
    });
  });

  describe('Casos de uso reales', () => {
    it('debe funcionar como botón de submit en formulario', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Enviar</Button>
        </form>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('debe mostrar estado de carga durante operación async', () => {
      render(<Button loading>Guardando...</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button.className).toContain('loading');
      expect(screen.getByText('Guardando...')).toBeInTheDocument();
    });

    it('debe renderizar botón de acción peligrosa', () => {
      const handleDelete = jest.fn();
      render(
        <Button variant="danger" onClick={handleDelete}>
          Eliminar
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button.className).toContain('danger');
      
      fireEvent.click(button);
      expect(handleDelete).toHaveBeenCalled();
    });

    it('debe renderizar botón con icono para reproducir música', () => {
      const handlePlay = jest.fn();
      const playIcon = <span data-testid="play-icon">▶</span>;
      
      render(
        <Button icon={playIcon} onClick={handlePlay}>
          Reproducir
        </Button>
      );
      
      expect(screen.getByTestId('play-icon')).toBeInTheDocument();
      expect(screen.getByText('Reproducir')).toBeInTheDocument();
      
      fireEvent.click(screen.getByRole('button'));
      expect(handlePlay).toHaveBeenCalled();
    });
  });
});
