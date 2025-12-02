export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Ma\'lumot mavjud emas';

  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Noto\'g\'ri sana';
    }

    const months = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year} ${hours}:${minutes}`;
  } catch (error) {
    return 'Noto\'g\'ri sana';
  }
}; 