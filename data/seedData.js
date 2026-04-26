// Seed data applied on first launch only. Guarded by the `seeded:v1` flag.
// Dates are computed relative to launch so the seeded jobs stay in the future.

import { addDays, setHours, setMinutes, startOfDay, subDays } from 'date-fns';
import { generateId } from '../utils/ids';

const jobAt = (daysFromToday, hour) => {
  const base = startOfDay(addDays(new Date(), daysFromToday));
  return setMinutes(setHours(base, hour), 0).getTime();
};

export const buildSeedData = () => {
  const employees = [
    { id: 'e1', name: 'Maria', active: true },
    { id: 'e2', name: 'Elena', active: true },
    { id: 'e3', name: 'Jasmine', active: true },
    { id: 'e4', name: 'Priya', active: true },
    { id: 'e5', name: 'Leah', active: true },
    { id: 'e6', name: 'Tasha', active: true },
  ];

  const client1Id = generateId();
  const client2Id = generateId();

  const clients = [
    {
      id: client1Id,
      name: 'Laura Chen',
      phone: '(415) 555-0142',
      email: 'laura.chen@example.com',
      address: '128 Laurel Ave, Apt 3B, San Francisco, CA',
      notes: 'Has a friendly golden retriever named Biscuit. Key under mat.',
      createdAt: Date.now(),
    },
    {
      id: client2Id,
      name: 'Rahul & Priya Desai',
      phone: '(650) 555-0199',
      email: 'priya.desai@example.com',
      address: '92 Whitman Lane, Palo Alto, CA',
      notes: 'Eco-only products. No fragrances, please.',
      createdAt: Date.now(),
    },
  ];

  const jobs = [
    {
      id: generateId(),
      clientId: client1Id,
      startAt: jobAt(1, 10),
      durationMinutes: 120,
      employeeIds: ['e1', 'e2'],
      notes: 'Deep clean kitchen, watch out for the dog.',
      status: 'scheduled',
      notificationId: null,
    },
    {
      id: generateId(),
      clientId: client2Id,
      startAt: jobAt(3, 13),
      durationMinutes: 150,
      employeeIds: ['e3', 'e4'],
      notes: 'Bring eco supplies only.',
      status: 'scheduled',
      notificationId: null,
    },
  ];

  const payments = [
    {
      id: generateId(),
      clientId: client1Id,
      jobId: null,
      amount: 180.0,
      dueDate: startOfDay(subDays(new Date(), 3)).getTime(),
      paidAt: null,
      note: 'Biweekly clean — invoice #1041',
    },
  ];

  return { employees, clients, jobs, payments };
};
