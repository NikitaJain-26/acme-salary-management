import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from '@jest/globals'
import i18n from '../../i18n'
import LanguageSelector from './LanguageSelector'

afterEach(async () => {
  await i18n.changeLanguage('en')
  localStorage.removeItem('acme-language')
})

describe('LanguageSelector', () => {
  it('changes the interface language and persists the selection', async () => {
    render(<LanguageSelector />)

    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), {
      target: { value: 'es' },
    })

    await waitFor(() => {
      expect(
        (screen.getByRole('combobox', { name: 'Idioma' }) as HTMLSelectElement)
          .value,
      ).toBe('es')
    })
    expect(localStorage.getItem('acme-language')).toBe('es')
  })
})
