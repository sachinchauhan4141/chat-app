const Message = ({ chatData }) => {
  const { text, time, mine, img } = chatData;
  const date = new Date(time);
  const updatedAt = date.toUTCString();
  return (
    <div className={`flex mb-2 ${mine && "justify-end"}`}>
      <div
        className="rounded py-2 px-3"
        style={{ backgroundColor: mine ? "#E2F7CB" : "#F2F2F2" }}
      >
        {img && <img src={img} alt="img" className="h-48"/>}
        <p className="text-md font-normal mt-1">{text}</p>
        <p className="text-right text-xs font-light text-grey-dark mt-1">{updatedAt}</p>
      </div>
    </div>
  );
};

export default Message;
