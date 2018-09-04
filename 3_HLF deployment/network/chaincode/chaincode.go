package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
)

// Response is a response template for all request
type Response struct {
	Status int         `json:"status"`
	Data   interface{} `json:"data"`
}

// User is a type represent a user balance in blockchain
type User struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Balance     int    `json:"balance"`
}

type chaincode struct{}

func (c chaincode) Init(stub shim.ChaincodeStubInterface) peer.Response {
	return shim.Success(nil)
}

func (c chaincode) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	var res Response
	var err error

	function, args := stub.GetFunctionAndParameters()
	switch function {
	case "register":
		res, err = register(stub, args)
	case "view":
		res, err = view(stub, args)
	case "transfer":
		res, err = transfer(stub, args)
	case "list":
		res, err = list(stub, args)
	case "get_state":
		res, err = getState(stub, args)
	default:
		return shim.Error("unknown function")
	}

	if err != nil {
		return shim.Error(err.Error())
	}

	b, err := json.Marshal(res)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(b)
}

func main() {
	if err := shim.Start(chaincode{}); err != nil {
		fmt.Println("error start smart contract", err)
	}
}

func register(stub shim.ChaincodeStubInterface, args []string) (Response, error) {
	type request struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Balance     int    `json:"balance"`
	}

	req := request{}

	err := json.Unmarshal([]byte(args[0]), &req)
	if err != nil {
		return Response{}, err
	}

	user := User{}
	user.Name = req.Name
	user.Description = req.Description
	user.Balance = req.Balance

	nameKey, err := stub.CreateCompositeKey("user", []string{"name", user.Name})
	if err != nil {
		return Response{}, err
	}

	// validate duplicate user
	if b, _ := stub.GetState(nameKey); b != nil {
		return Response{
			Status: 400,
			Data:   fmt.Sprintf("user %q is already exist", user.Name),
		}, nil
	}

	b, err := json.Marshal(user)
	if err != nil {
		return Response{}, err
	}

	stub.PutState(nameKey, b)

	return Response{
		Status: 200,
		Data:   user,
	}, nil
}

func view(stub shim.ChaincodeStubInterface, args []string) (Response, error) {
	type request struct {
		Name string `json:"name"`
	}

	req := request{}

	err := json.Unmarshal([]byte(args[0]), &req)
	if err != nil {
		return Response{}, err
	}

	nameKey, err := stub.CreateCompositeKey("user", []string{"name", req.Name})
	if err != nil {
		return Response{}, err
	}

	b, err := stub.GetState(nameKey)
	if err != nil {
		return Response{}, err
	}

	if b == nil {
		return Response{
			Status: 400,
			Data:   fmt.Sprintf("user %q does not exist", req.Name),
		}, nil
	}

	user := User{}
	err = json.Unmarshal(b, &user)
	if err != nil {
		return Response{}, err
	}

	return Response{
		Status: 200,
		Data:   user,
	}, nil
}

func transfer(stub shim.ChaincodeStubInterface, args []string) (Response, error) {
	type request struct {
		From   string `json:"from"`
		To     string `json:"to"`
		Amount int    `json:"amount"`
	}

	req := request{}
	err := json.Unmarshal([]byte(args[0]), &req)
	if err != nil {
		return Response{}, err
	}

	if req.Amount < 0 {
		return Response{
			Status: 400,
			Data:   fmt.Sprintf("amount cannot be negative"),
		}, nil
	}

	fromKey, err := stub.CreateCompositeKey("user", []string{"name", req.From})
	if err != nil {
		return Response{}, err
	}
	toKey, err := stub.CreateCompositeKey("user", []string{"name", req.To})
	if err != nil {
		return Response{}, err
	}

	// get source user
	b, err := stub.GetState(fromKey)
	if err != nil {
		return Response{}, err
	}

	if b == nil {
		return Response{
			Status: 400,
			Data:   fmt.Sprintf("user %q does not exist", req.From),
		}, nil
	}

	source := User{}
	err = json.Unmarshal(b, &source)
	if err != nil {
		return Response{}, err
	}

	// get destination user
	b, err = stub.GetState(toKey)
	if err != nil {
		return Response{}, err
	}

	if b == nil {
		return Response{
			Status: 400,
			Data:   fmt.Sprintf("user %q does not exist", req.To),
		}, nil
	}

	dest := User{}
	err = json.Unmarshal(b, &dest)
	if err != nil {
		return Response{}, err
	}

	if source.Balance < req.Amount {
		return Response{
			Status: 400,
			Data:   fmt.Sprintf("%q does not have sufficient balance to transfer", req.From),
		}, nil
	}

	source.Balance = source.Balance - req.Amount
	dest.Balance = dest.Balance + req.Amount

	// write source user
	b, err = json.Marshal(source)
	if err != nil {
		return Response{}, err
	}
	err = stub.PutState(fromKey, b)
	if err != nil {
		return Response{}, err
	}

	// write destination user
	b, err = json.Marshal(dest)
	if err != nil {
		return Response{}, err
	}
	err = stub.PutState(toKey, b)
	if err != nil {
		return Response{}, err
	}

	return Response{
		Status: 200,
		Data:   "success",
	}, nil
}

func list(stub shim.ChaincodeStubInterface, args []string) (Response, error) {
	iterator, err := stub.GetStateByPartialCompositeKey("user", []string{"name"})
	if err != nil {
		return Response{}, err
	}
	defer iterator.Close()
	var users []User
	for iterator.HasNext() {
		kv, err := iterator.Next()
		if err != nil {
			return Response{}, err
		}
		var user User
		err = json.Unmarshal(kv.Value, &user)
		if err != nil {
			return Response{}, err
		}
		users = append(users, user)
	}
	return Response{
		Status: 200,
		Data:   users,
	}, nil
}

func getState(stub shim.ChaincodeStubInterface, args []string) (Response, error) {
	b, err := stub.GetState(args[0])
	if err != nil {
		return Response{}, err
	}
	return Response{
		Status: 200,
		Data:   string(b),
	}, nil
}
