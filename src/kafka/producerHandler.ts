export const producerErrorHandler = async (
  sent,
  dlq,
  producerErrCount,
  defaultProducerRetries,
) => {
  if (dlq) {
    if (sent['errIndex']) {
      const errIndex = sent['errIndex'];
      console.log(producerErrCount[errIndex], 'TEST TEST');
      if (producerErrCount[errIndex]['count'] <= defaultProducerRetries) {
        console.log('IN ERROR PRODUCER', producerErrCount[errIndex]);
        // throw sent['error'];
        return sent['error'];
      } else {
        console.log('PROD ERR COUNT SPLICED');
        producerErrCount.splice(errIndex, 1);
        const sendSlack = true;
        return sendSlack;
      }
    }
  }
  // for resolve toResolveTickets in liveFeedService
  return;
};
