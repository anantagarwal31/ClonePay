import { Users } from "../components/Users"
import { Appbar } from "./../components/Appbar"
import { Balance } from "./../components/Balance"
import { Button } from "../components/Button"
import { useNavigate } from "react-router-dom"
export const Dashboard = () => {
    const navigate = useNavigate();
    return <div>
        <Appbar/>
        <div className="m-8">
            <div className="flex justify-between items-center w-full">
                    <Balance value={"10,000"} />
                    <div className="w-auto">
                        <Button 
                            label={"Logout"} 
                            onClick={() => {
                                localStorage.removeItem("token");
                                navigate("/signin")
                            }} 
                        />
                    </div>
                </div>
            <Users/>
        </div>
    </div>
} 