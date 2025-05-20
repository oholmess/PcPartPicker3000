import axios from 'axios';

const getPricePrediction = async (data) => {
  const url = 'https://europe-southwest1-machinelearningproject-460413.cloudfunctions.net/get-price-prediction';
  try {

    const requestConfig = {
      method: 'GET',
      url: url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data
    };

    console.log("Request config:", {
      url: requestConfig.url,
      method: requestConfig.method,
      headers: {
          'Content-Type': requestConfig.headers['Content-Type'],
      },
      data: requestConfig.data
    })

    const response = await axios(requestConfig);
    console.log('Successfully did thing:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error doing thing:', {
      isAxiosError: error.isAxiosError,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
}

export { getPricePrediction };