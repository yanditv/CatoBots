import { User } from './models/User';
import bcrypt from 'bcryptjs';

const referees = [
  { name: "Paula Renata Tenesaca Pineda", cedula: "107456204" },
  { name: "José Andrés Abad Chimbo", cedula: "104728688" },
  { name: "Carlos Eduardo Centeno Yunga", cedula: "750213233" },
  { name: "Pablo Andres Correa Rojas", cedula: "302561212" },
  { name: "Tamia Luisa Gualán Saca", cedula: "1105598567" },
  { name: "Kevin David Mora Rivera", cedula: "106990146" },
  { name: "Cristian Emmanuel Lara Chacón", cedula: "1206983163" },
  { name: "Victor André Agila Púa", cedula: "706136272" },
  { name: "Brian Andersson Rivera Emperador", cedula: "302507843" },
  { name: "Juan Pablo Zambrano Monsalve", cedula: "959285917" },
  { name: "Mateo Sebastian Mejia Merizalde", cedula: "150022911" },
  { name: "Katheryn Trinidad Jiménez Naranjo", cedula: "650014608" },
  { name: "Pablo Esteban Enriquez Peña", cedula: "150700557" },
  { name: "Manuela Regina Guaman Corte", cedula: "942770884" },
  { name: "Diego Eduardo Bravo Marín", cedula: "107216749" },
  { name: "José Eduardo Cordero Segarra", cedula: "1726989831" }
];

async function seed() {
  console.log("Iniciando inserción de jueces...");
  
  for (const ref of referees) {
    try {
      const existing = await User.findOne({ where: { username: ref.cedula } });
      if (existing) {
        console.log(`Usuario ${ref.cedula} (${ref.name}) ya existe. Saltando...`);
        continue;
      }

      const hashedPassword = bcrypt.hashSync(ref.cedula, 8);
      await User.create({
        username: ref.cedula,
        password: hashedPassword,
        role: 'REFEREE'
      });
      console.log(`Juez insertado: ${ref.name} (${ref.cedula})`);
    } catch (err) {
      console.error(`Error al insertar a ${ref.name}:`, err);
    }
  }
  
  console.log("Proceso finalizado.");
}

seed();
