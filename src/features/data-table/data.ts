import {
  randFullName,
  randEmail,
  randNumber,
  randPastDate,
} from '@ngneat/falso';

import { DEPARTMENTS, type Employee } from './types';

let idCounter = 0;

function generateEmployee(): Employee {
  idCounter++;
  const name = randFullName();
  return {
    id: `emp_${idCounter}`,
    name,
    email: randEmail(),
    department: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
    salary: randNumber({ min: 40000, max: 200000 }),
    startDate: randPastDate({ years: 10 }).toISOString().split('T')[0],
  };
}

export function generateEmployees(count: number): Employee[] {
  idCounter = 0;
  return Array.from({ length: count }, generateEmployee);
}
