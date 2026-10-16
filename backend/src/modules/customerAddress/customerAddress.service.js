import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import CustomerAddress from './customerAddress.model.js';

export const createCustomerAddress = async (userId, data) => {
  const existingCount = await CustomerAddress.countDocuments({ user: userId });

  // If this is the user's first address, ensure it is set as default
  const shouldBeDefault = existingCount === 0 ? true : Boolean(data.isDefault);

  if (shouldBeDefault && existingCount > 0) {
    await CustomerAddress.updateMany({ user: userId }, { $set: { isDefault: false } });
  }

  const address = await CustomerAddress.create({
    ...data,
    user: userId,
    isDefault: shouldBeDefault,
  });

  return address;
};

export const getCustomerAddresses = async (userId) => {
  const addresses = await CustomerAddress.find({ user: userId })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();

  return addresses;
};

export const getCustomerAddressById = async (userId, addressId) => {
  if (!mongoose.isValidObjectId(addressId)) {
    throw new ApiError(400, 'Invalid address ID format');
  }

  const address = await CustomerAddress.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  return address;
};

export const updateCustomerAddress = async (userId, addressId, updateData) => {
  if (!mongoose.isValidObjectId(addressId)) {
    throw new ApiError(400, 'Invalid address ID format');
  }

  const address = await CustomerAddress.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  if (updateData.isDefault === true) {
    await CustomerAddress.updateMany(
      { user: userId, _id: { $ne: addressId } },
      { $set: { isDefault: false } },
    );
  }

  // Prevent unsetting default if this is the only address
  if (updateData.isDefault === false && address.isDefault) {
    const count = await CustomerAddress.countDocuments({ user: userId });
    if (count <= 1) {
      updateData.isDefault = true;
    }
  }

  Object.assign(address, updateData);
  await address.save();

  return address;
};

export const deleteCustomerAddress = async (userId, addressId) => {
  if (!mongoose.isValidObjectId(addressId)) {
    throw new ApiError(400, 'Invalid address ID format');
  }

  const address = await CustomerAddress.findOneAndDelete({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  // If the deleted address was the default, make the most recently created remaining address the new default
  if (address.isDefault) {
    const nextDefault = await CustomerAddress.findOne({ user: userId }).sort({ createdAt: -1 });
    if (nextDefault) {
      nextDefault.isDefault = true;
      await nextDefault.save();
    }
  }

  return { id: addressId, message: 'Address deleted successfully' };
};

export const setDefaultCustomerAddress = async (userId, addressId) => {
  if (!mongoose.isValidObjectId(addressId)) {
    throw new ApiError(400, 'Invalid address ID format');
  }

  const address = await CustomerAddress.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  await CustomerAddress.updateMany({ user: userId }, { $set: { isDefault: false } });

  address.isDefault = true;
  await address.save();

  return address;
};

export const getDefaultCustomerAddress = async (userId) => {
  let address = await CustomerAddress.findOne({
    user: userId,
    isDefault: true,
  });

  if (!address) {
    address = await CustomerAddress.findOne({ user: userId }).sort({ createdAt: -1 });
  }

  return address;
};
