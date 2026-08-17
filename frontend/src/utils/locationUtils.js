export const formatStoreLocation = (storeOrAddress, city = null) => {
  let address = '';
  let cityName = city;

  if (typeof storeOrAddress === 'object' && storeOrAddress !== null) {
    address = storeOrAddress.address || '';
    cityName = storeOrAddress.city || null;
  } else {
    address = storeOrAddress || '';
  }

  address = address.trim();
  if (cityName && typeof cityName === 'string' && cityName.trim().length > 0) {
    cityName = cityName.trim();
  } else {
    cityName = null;
  }

  if (!address) {
    return cityName || 'Location not specified';
  }

  if (!cityName) {
    return address;
  }

  // If address already contains the city name (case-insensitive), return address only to prevent duplicate concatenation
  if (address.toLowerCase().includes(cityName.toLowerCase())) {
    return address;
  }

  return `${address}, ${cityName}`;
};
