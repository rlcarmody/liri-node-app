const formatDate = datetime => {
    datetime = new Date(datetime);
    const year = datetime.getFullYear();
    const month = datetime.getMonth() + 1;
    const day = datetime.getDate();
    const formattedMonth = month < 10 ? '0' + month : month;
    const formattedDay = day < 10 ? '0' + day : day;
    return `${formattedMonth}/${formattedDay}/${year}`;
}
module.exports = formatDate;