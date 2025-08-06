import { Link } from "react-router";

const Home = () => {
  return (
    <div className={"w-full h-full"}>
      <Link className="px-2 -py-2 bg-blue-300 rounded-md font-quicksand-bold" to="/settings">
        Go to Settings
      </Link>
    </div>
  );
};

export default Home;
