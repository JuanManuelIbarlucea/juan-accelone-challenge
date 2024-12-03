import { faker } from '@faker-js/faker';
import { beforeEach } from 'node:test';
import { Sequelize } from 'sequelize-typescript';
import { createMemDB } from '../utils/testing/createMemDB';
import { ContactsService } from './contacts.service';
import { Contact } from './entities/contact.entity';

describe('ContactsService', () => {
  let service: ContactsService;
  let memDb: Sequelize;

  beforeAll(async () => {
    memDb = await createMemDB([Contact]);
    // Instantiate our service with our model
    service = new ContactsService(Contact);

    await memDb.sync();
  });

  afterAll(async () => {
    await memDb.close();
  });

  describe('CRUD test', () => {
    afterEach(async () => {
      memDb.truncate();
    });

    describe('Create', () => {
      it('should create a contact', async () => {
        const contact = await service.create({
          name: 'John Doe',
          number: '9999999999',
          email: 'john@test.com',
          notes: 'Testing',
        });

        expect(contact).toBeDefined();
        expect(contact.id).toBeDefined();
        expect(contact.name).toBe('John Doe');
        expect(contact.number).toBe('9999999999');
        expect(contact.email).toBe('john@test.com');
        expect(contact.notes).toBe('Testing');
      });

      it('should throw an error if email is duplicated', async () => {
        try {
          await service.create({
            name: 'John Doe',
            number: '1111111111',
            email: 'john@test.com',
            notes: 'Testing',
          });

          await service.create({
            name: 'John Doe',
            number: '2222222222',
            email: 'john@test.com',
            notes: 'Testing',
          });
          expect(true).toBe(false);
        } catch (e) {
          expect(e.message).toBe('Email or number already exists');
        }
      });

      it('should throw an error if phone is duplicated', async () => {
        try {
          await service.create({
            name: 'John Doe',
            number: '1234567890',
            email: 'test@test.com',
            notes: 'Testing',
          });

          await service.create({
            name: 'John Doe',
            number: '1234567890',
            email: 'random@test.com',
            notes: 'Testing',
          });
          expect(true).toBe(false);
        } catch (e) {
          expect(e.message).toBe('Email or number already exists');
        }
      });
    });
  });

  describe('FindAll', () => {
    it('should return an array of contacts', async () => {
      for (let i = 0; i < 3; i++) {
        await Contact.create({
          name: faker.person.fullName(),
          number: faker.phone.number(),
          email: faker.internet.email(),
          notes: faker.lorem.sentence(),
        });
      }
      const contacts = await service.findAll();
      expect(contacts).toBeDefined();
      expect(contacts.length).toBe(3);
    });
  });

  describe('FindOne', () => {
    it('should return a contact', async () => {
      const contacts = [];
      for (let i = 0; i < 3; i++) {
        const contact = await Contact.create({
          name: faker.person.fullName(),
          number: faker.phone.number(),
          email: faker.internet.email(),
          notes: faker.lorem.sentence(),
        });
        contacts.push(contact);
      }
      const contact = await service.findOne(contacts[0].id);
      expect(contact).toBeDefined();
      expect(contact.id).toBe(contacts[0].id);
    });

    it('should return null if not found', async () => {
      const contact = await service.findOne(999);
      expect(contact).toBeNull();
    });
  });

  describe('Update', () => {
    it('should update a contact', async () => {
      const contacts = [];
      for (let i = 0; i < 3; i++) {
        const contact = await Contact.create({
          name: faker.person.fullName(),
          number: faker.phone.number(),
          email: faker.internet.email(),
          notes: faker.lorem.sentence(),
        });
        contacts.push(contact);
      }
      const contact = await service.update(contacts[0].id, {
        name: 'Jane Doe',
        number: '8888888888',
        email: 'test@test.com',
        notes: 'Testing',
      });

      expect(contact).toBeDefined();
      expect(contact.id).toBe(contacts[0].id);
      expect(contact.name).toBe('Jane Doe');
      expect(contact.number).toBe('8888888888');
      expect(contact.email).toBe('test@test.com');
      expect(contact.notes).toBe('Testing');
    });

    it('should throw an error if contact does not exist', async () => {
      try {
        await service.update(999, {
          name: 'Jane Doe',
          number: '8888888888',
          email: 'test@test,com',
          notes: 'Testing',
        });
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('Contact not found');
      }
    });

    it('should throw an error if email is duplicated', async () => {
      try {
        const contacts: Contact[] = [];
        for (let i = 0; i < 3; i++) {
          const contact = await Contact.create({
            name: faker.person.fullName(),
            number: faker.phone.number(),
            email: faker.internet.email(),
            notes: faker.lorem.sentence(),
          });
          contacts.push(contact);
        }

        await service.update(contacts[0].id, {
          name: 'Jane Doe',
          number: '8888888888',
          email: contacts[1].email,
          notes: 'Testing',
        });
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('Email or number already exists');
      }
    });

    it('should throw an error if phone is duplicated', async () => {
      try {
        const contacts: Contact[] = [];
        for (let i = 0; i < 3; i++) {
          const contact = await Contact.create({
            name: faker.person.fullName(),
            number: faker.phone.number(),
            email: faker.internet.email(),
            notes: faker.lorem.sentence(),
          });
          contacts.push(contact);
        }

        await service.update(contacts[0].id, {
          name: 'Jane Doe',
          number: contacts[1].number,
          email: 'random@random.com',
          notes: 'Testing',
        });
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('Email or number already exists');
      }
    });
  });
  describe('Delete', () => {
    it('should delete a contact', async () => {
      const contacts = [];
      for (let i = 0; i < 3; i++) {
        const contact = await Contact.create({
          name: faker.person.fullName(),
          number: faker.phone.number(),
          email: faker.internet.email(),
          notes: faker.lorem.sentence(),
        });
        contacts.push(contact);
      }
      await service.remove(contacts[0].id);
      const contact = await service.findOne(contacts[0].id);
      expect(contact).toBeNull();
    });

    it('should throw an error if contact does not exist', async () => {
      try {
        await service.remove(999);
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('Contact not found');
      }
    });
  });
});
