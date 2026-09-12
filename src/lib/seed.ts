import { connectToDatabase } from './db';
import Admin from './models/Admin';
import { hashPassword } from './auth';

export async function seedAdmin() {
  await connectToDatabase();

  const passwordHash = await hashPassword('AdminPass123!');
  const existingAdmin = await Admin.findOne({ email: 'admin@f2whitecoat.com' });

  if (!existingAdmin) {
    await Admin.create({
      name: 'Super Admin',
      email: 'admin@f2whitecoat.com',
      passwordHash,
      role: 'admin',
    });
    console.log('Default admin created: admin@f2whitecoat.com / AdminPass123!');
  } else {
    existingAdmin.passwordHash = passwordHash;
    await existingAdmin.save();
    console.log('Default admin password reset: admin@f2whitecoat.com / AdminPass123!');
  }
}
