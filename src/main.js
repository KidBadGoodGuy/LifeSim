import { LifeSimulation } from './systems/simulation.js';
import { render } from './ui/render.js';

const app = document.querySelector('#app');
const sim = new LifeSimulation(20260510);
render(app, sim);
