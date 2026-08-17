export const formatStoreLocation = (storeOrAddress, city = null) => {
  if (!storeOrAddress && !city) {
    return 'Location not specified';
  }

  let address = '';
  let cityName = city;

  if (typeof storeOrAddress === 'object' && storeOrAddress !== null) {
    address = storeOrAddress.address || '';
    cityName = storeOrAddress.city || city || null;
  } else if (storeOrAddress) {
    address = String(storeOrAddress);
  }

  address = typeof address === 'string' ? address.trim() : String(address || '').trim();
  cityName = typeof cityName === 'string' ? cityName.trim() : (cityName ? String(cityName).trim() : null);

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
