import React from 'react';
import { mount } from '@cypress/react';
import Footer from '../../src/components/layout/footer';

it('renders a footer', () => {
  mount(<Footer />);
  cy.get('a').contains('built');
});
