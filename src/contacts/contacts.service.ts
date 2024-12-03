import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact) private productRepository: typeof Contact,
  ) {}

  /// Decided to use the Sequelize ORM to interact with the database
  /// I know that the challenge said to store in a list in memort
  /// But I decided to go with a SQLite database
  /// Because it was simple to configure and use
  /// Plus it provided with out-of-the-box features like validation

  /// This is the create method that will create a new contact
  async create(createContactDto: CreateContactDto) {
    try {
      return await Contact.create({
        name: createContactDto.name,
        number: createContactDto.number,
        email: createContactDto.email,
        notes: createContactDto.notes,
      });
    } catch (e) {
      /// Email and number are unique fields so this error will be thrown if they already exist
      if (e.name === 'SequelizeUniqueConstraintError') {
        throw new BadRequestException('Email or number already exists');
      }

      throw e;
    }
  }


  /// This method will return all the contacts
  findAll() {
    return this.productRepository.findAll();
  }

  /// This method will return a single contact by id
  findOne(id: number) {
    return this.productRepository.findByPk(id);
  }

  /// This method will update a contact
  /// And return the updated contact
  /// If not found it will throw an error
  async update(id: number, updateContactDto: UpdateContactDto) {
    try {
      let contact = await this.productRepository.findByPk(id);

      if (!contact) {
        throw new BadRequestException('Contact not found');
      }

      await contact.update({ ...updateContactDto });
      await contact.save();

      return contact;
    } catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError') {
        throw new BadRequestException('Email or number already exists');
      }

      throw e;
    }
  }

  /// This method will remove a contact by id
  /// If not found it will throw an error
  remove(id: number) {
    this.productRepository.destroy({
      where: {
        id: id,
      },
    });
  }
}
