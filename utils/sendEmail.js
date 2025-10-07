import fetch from 'node-fetch';

const sendEmail = async (options) => {
  const { to, subject, template, data } = options;
  const url = process.env.EMAIL_SERVICE_URL;
  const apiKey = process.env.EMAIL_SERVICE_API_KEY;

  const body = {
    to,
    subject,
    template,
    context: data, // The microservice might expect 'context' instead of 'data'
  };

  try {
    const response = await fetch(`${url}/send`, { // Assuming the endpoint is /send
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey, // Using x-api-key as a common practice for API keys
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Email service failed with status ${response.status}: ${errorData}`);
    }

    console.log('Email sent successfully via microservice.');
    return await response.json();

  } catch (error) {
    console.error('Error sending email via microservice:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

export default sendEmail;