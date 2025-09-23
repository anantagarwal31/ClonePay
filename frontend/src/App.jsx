import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Signup } from "./pages/Signup"
import { Signin } from "./pages/Signin"
import { Dashboard } from "./pages/Dashboard"
import { SendMoney } from "./pages/SendMoney"
import { Me } from "./pages/Me"

function App() {

  return (
    <div>
        <BrowserRouter>
          <Routes>
            <Route path="/signup" element={<Me><Signup/></Me>}></Route>
            <Route path="/signin" element={<Me><Signin/></Me>}></Route>
            <Route path="/dashboard" element={<Dashboard/>}></Route>
            <Route path="/send" element={<SendMoney/>}></Route>
          </Routes>
        </BrowserRouter>
    </div>
  )
}

export default App
