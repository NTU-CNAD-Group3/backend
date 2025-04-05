class LoggerService {
  async log(level, message, ...metadata) {
    // const lokiLogEntry = {
    //   streams: [
    //     {
    //       stream: {
    //         level,
    //         service_name: 'auth',
    //       },
    //       values: [[`${Date.now() * 1000000} ${message}`, metadata]],
    //     },
    //   ],
    // };

    try {
      // await axios.post(`${config.LOKI_HOST}`, lokiLogEntry);
      console.log(`[${level.toUpperCase()}] ${message}`);
    } catch (error) {
      console.error('Error logging to Loki: ', error);
    }
  }

  fatal(payload) {
    const { message, metadata } = payload;
    this.log('fatal', message, metadata);
  }

  error(payload) {
    const { message, ...metadata } = payload;
    this.log('error', message, metadata);
  }

  warn(payload) {
    const { message, ...metadata } = payload;
    this.log('warn', message, metadata);
  }

  info(payload) {
    const { message, ...metadata } = payload;
    this.log('info', message, metadata);
  }

  debug(payload) {
    const { message, ...metadata } = payload;
    this.log('debug', message, metadata);
  }
}

export default new LoggerService();
